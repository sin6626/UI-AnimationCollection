import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {KommentarController} from "./controller/kommentar.controller.js";
import {KommentarService} from "./service/kommentar.service.js";
import {KommentareEntity} from "./entities/kommentare.entity.js";
import {UsersEntity} from "../module_user/entities/users.entity.js";

@Module({
    imports: [
        TypeOrmModule.forFeature([KommentareEntity, UsersEntity])
    ],
    controllers: [KommentarController],
    providers: [KommentarService],
    exports: [KommentarService],
})
export class KommentarModule {
}
