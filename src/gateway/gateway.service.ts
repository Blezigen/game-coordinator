import {Inject, Injectable, OnApplicationBootstrap} from "@nestjs/common";
import {ClientProxy} from "@nestjs/microservices";
import {EventBus, ofType, QueryBus} from "@nestjs/cqrs";
import {QueueUpdatedEvent} from "src/gateway/gateway/events/queue-updated.event";
import {PartyRepository} from "src/mm/party/repository/party.repository";
import {QueueRepository} from "src/mm/queue/repository/queue.repository";
import {QueueCreatedEvent} from "src/gateway/gateway/events/queue-created.event";
import {ReadyCheckStartedEvent} from "src/gateway/gateway/events/ready-check-started.event";
import {ReadyStateUpdatedEvent} from "src/gateway/gateway/events/ready-state-updated.event";
import {RoomReadyCheckCompleteEvent} from "src/gateway/gateway/events/room-ready-check-complete.event";
import {RoomReadyEvent} from "src/gateway/gateway/events/room-ready.event";
import {RoomNotReadyEvent} from "src/gateway/gateway/events/room-not-ready.event";
import {PartyInviteExpiredEvent} from "src/gateway/gateway/events/party/party-invite-expired.event";
import {PartyInviteCreatedEvent} from "src/gateway/gateway/events/party/party-invite-created.event";
import {PartyUpdatedEvent} from "src/gateway/gateway/events/party/party-updated.event";
import {PartyInviteAcceptedEvent} from "src/gateway/gateway/events/party/party-invite-accepted.event";

@Injectable()
export class GatewayService implements OnApplicationBootstrap {
  constructor(
    private readonly ebus: EventBus,
    private readonly qbus: QueryBus,
    private readonly partyRepository: PartyRepository,
    private readonly queueRepository: QueueRepository,
    @Inject("RedisQueue") private readonly redisEventQueue: ClientProxy,
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.redisEventQueue.connect();
    } catch (e) {}


    // events to publish to global
    const publicEvents: any[] = [
      QueueCreatedEvent,
      QueueUpdatedEvent,
      ReadyStateUpdatedEvent,
      ReadyCheckStartedEvent,
      RoomReadyCheckCompleteEvent,
      RoomReadyEvent,
      RoomNotReadyEvent,

      PartyInviteExpiredEvent,
      PartyInviteCreatedEvent,
      PartyUpdatedEvent
    ];
    this.ebus
      .pipe(ofType(...publicEvents))
      .subscribe(t => this.redisEventQueue.emit(t.constructor.name, t));

    this.queryTransmission();
  }

  private queryTransmission() {
    // @ts-ignore
    // this.qbus.register([transmitter(this.redisEventQueue, GetPlayerInfoQuery)]);
  }
}

