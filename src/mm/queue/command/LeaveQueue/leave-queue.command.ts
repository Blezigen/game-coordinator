import { MatchmakingMode } from "src/gateway/gateway/shared-types/matchmaking-mode";
import { PartyId } from "src/gateway/gateway/shared-types/party-id";

export class LeaveQueueCommand {
  constructor(public readonly mode: MatchmakingMode, public readonly partyId: PartyId) {
  }
}