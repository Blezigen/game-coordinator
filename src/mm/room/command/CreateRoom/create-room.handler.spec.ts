import { Test, TestingModule } from "@nestjs/testing";
import { CommandBus, EventBus } from "@nestjs/cqrs";
import { clearRepositories, TestEnvironment } from "src/@test/cqrs";
import { RoomProviders } from "src/mm/room";
import { CreateRoomHandler } from "src/mm/room/command/CreateRoom/create-room.handler";
import { CreateRoomCommand, PartyInRoom } from "src/mm/room/command/CreateRoom/create-room.command";
import { MatchmakingMode } from "src/mm/queue/model/entity/matchmaking-mode";
import { RoomSizes } from "src/mm/room/model/entity/room-size";
import { PlayerInQueueEntity } from "src/mm/queue/model/entity/player-in-queue.entity";
import { PlayerInPartyInRoom } from "src/mm/room/model/room-entry";
import { RoomCreatedEvent } from "src/mm/room/event/room-created.event";

describe("CreateRoomHandler", () => {
  let ebus: EventBus;
  let cbus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [...RoomProviders, ...TestEnvironment()],
    }).compile();

    cbus = module.get<CommandBus>(CommandBus);
    ebus = module.get<EventBus>(EventBus);

    cbus.register([CreateRoomHandler]);
  });

  afterEach(() => {
    clearRepositories();
  });

  it("", async () => {
    const roomID = await cbus.execute(
      new CreateRoomCommand(
        MatchmakingMode.SOLOMID,
        RoomSizes[MatchmakingMode.SOLOMID],
        [
          new PartyInRoom(
            MatchmakingMode.SOLOMID,
            [
              new PlayerInQueueEntity("1", 1000),
              new PlayerInQueueEntity("2", 1000),
            ].map(p => new PlayerInPartyInRoom(p.playerId, p.mmr)),
          ),
        ],
      ),
    );

    expect(ebus).toEmit(
      new RoomCreatedEvent(roomID)
    )
  });
});