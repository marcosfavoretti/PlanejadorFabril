import { IsDate, IsNumber, IsString } from "class-validator";
import { User } from "../modules/user/@core/entities/User.entity";
import { Type } from "class-transformer";
import { MergeRequest } from "../modules/fabrica/@core/entities/MergeRequest.entity";
import { ApiProperty } from "@nestjs/swagger";
import { UserResDto } from "./UserRes.dto";

export class MergeRequestPendingDto {
    @ApiProperty()
    @IsString()
    fabricaId: string;

    @ApiProperty()
    @IsNumber()
    mergeRequestId: number;

    @ApiProperty({
        type: () => UserResDto
    })
    @Type(() => UserResDto)
    user: UserResDto;

    @ApiProperty()
    @IsDate()
    criadaEm: Date;

    static createByEntity(merge: MergeRequest): MergeRequestPendingDto {
        return {
            fabricaId: merge.fabrica.fabricaId,
            criadaEm: merge.criadaEm,
            mergeRequestId: merge.mergeRequestId,
            user: { ...merge.feitoPor }
        }
    }
}