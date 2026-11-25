// What the bridges can read from React (kept fresh on every render).
import type { Friend, Profile } from "../lib/types";
import type { PresenceState } from "../lib/api/presence";

export interface Ctx {
  profile: Profile;
  refreshProfile: () => Promise<void>;
  /** Go to Home and open the friends list (the lamp on Schedule and Study). */
  openFriends?: () => void;
  social: {
    friends: Friend[];
    online: Map<string, PresenceState>;
    reloadFriends: () => Promise<void>;
    setTimerStatus: (s: "focusing" | "paused" | "online", activity?: string) => void;
  };
}
