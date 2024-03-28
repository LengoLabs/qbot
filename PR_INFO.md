# Changes
* Styling changes for the config.
* Due to new config structure, certain commands have been re-worked for group argument to be required.
* /setrank works now for multigroup roles arg.
* /roles works for multigroup.
* api.ts works for multigroup. queryString param "groupId" is required to be passed on certain API endpoints which touch a group. Example: promote, xp, etc.
* Attempting to run XP commands while it's disabled, returns a Embed saying the XP system is disabled.
* Additional type interfaces for config.

> [!CAUTION]
> In this new version of qbot, previous data of XP & suspensions will be lost due to new DB structure for multigroup.

Full multigroup support. Please read config.ts for a understanding how this works.

# Tests
Everything has been tested, **execept the XP & Suspension systems.**

# Status
STABLE: **YES**

# Contributors
* [vq9o](https://github.com/vq9o)
* [yogurtsyum](https://github.com/yogurtsyum) 