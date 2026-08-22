-- Web push targets users by OneSignal "external id", which the client sets to
-- the Clerk user id via OneSignal.login(). That alias covers every browser and
-- device a user is signed in on, whereas this single-valued column could only
-- ever hold one subscription -- a second device silently overwrote the first.
-- Nothing ever wrote to it, so there is no data to migrate.

-- AlterTable
ALTER TABLE "User" DROP COLUMN "oneSignalPlayerId";
