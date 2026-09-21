import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import {
    DataSource,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
    SoftRemoveEvent,
} from 'typeorm';

@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
    constructor(
        private readonly cls: ClsService,
        dataSource: DataSource,
    ) {
        dataSource.subscribers.push(this);
    }

    beforeInsert(event: InsertEvent<any>) {
        const userId = this.cls.get<string>('userId');
        if (userId && event.entity) {
            event.entity.createdBy ??= userId;
            event.entity.updatedBy ??= userId;
        }
    }

    beforeUpdate(event: UpdateEvent<any>) {
        const userId = this.cls.get<string>('userId');
        if (userId && event.entity) {
            event.entity.updatedBy = userId;
        }
    }

    beforeSoftRemove(event: SoftRemoveEvent<any>) {
        const userId = this.cls.get<string>('userId');
        if (userId && event.entity) {
            event.entity.deletedBy = userId;
        }
    }
}
