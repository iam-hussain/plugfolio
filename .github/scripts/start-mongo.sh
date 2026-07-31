#!/usr/bin/env bash
# A single-node MongoDB replica set for CI.
#
# Not a `services:` container: those can't override the image's command, and
# Prisma needs `--replSet` because two repositories use $transaction, which
# Mongo only supports on a replica set. The set advertises localhost:27017 so
# the mapped port is what clients reach.
set -euo pipefail

docker run -d --name mongo -p 27017:27017 mongo:7 --replSet rs0 --bind_ip_all

for _ in $(seq 30); do
  docker exec mongo mongosh --quiet --eval 'db.runCommand({ ping: 1 })' >/dev/null 2>&1 && break
  sleep 1
done

docker exec mongo mongosh --quiet --eval \
  'rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "localhost:27017" }] })'

# Electing a primary takes a beat; writing before then fails with
# NotWritablePrimary, which reads as a flaky test rather than a race.
for _ in $(seq 30); do
  docker exec mongo mongosh --quiet --eval 'db.hello().isWritablePrimary' | grep -q true && exit 0
  sleep 1
done

echo "mongo replica set did not elect a primary" >&2
exit 1
