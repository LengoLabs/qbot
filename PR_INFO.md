# Changes
Forked from qbot/multi-group.

* Some sections have been entirely re-written such as deprecation/phase of previous addon & primary group for a better config & clean code.
* Code issue fixes
* Multi-group support
* queryString param "groupId" is required to be passed on API endpoints which touch a group. Example: promote, xp, etc.

> [!CAUTION]
> In this new version of qbot, previous data of XP & suspensions will be lost due to new DB structure.

# TODO:
* Code & param cleanup.
* Code review

# Issues
## Prisma database is untouched
~~Additional modifications for multi-group/new config is required. qbot *may be fine* as long you don't utilize database releated functions. -- Current priority to get database done.~~
* ~~Update: Seem's completed. requires testing. api.ts needs updated for it.~~
* Update: Seems fully done, testing required.

## handleInteraction
handleInteraction needs to be updated for getting robloxGroup for role searching. Currently broken.

# Status
STABLE: **NO**
TESTING: **IN-PROGRESS**

# Contributors:
* [vq9o](https://github.com/vq9o)
* [yogurtsyum](https://github.com/yogurtsyum) 