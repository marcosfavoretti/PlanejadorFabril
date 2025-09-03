import { Inject, InternalServerErrorException } from "@nestjs/common";
import { MergeRequestRepository } from "../repository/MergeRequest.repository";
import { MergeRequest } from "../../@core/entities/MergeRequest.entity";
import { Fabrica } from "../../@core/entities/Fabrica.entity";
import { User } from "@libs/lib/modules/user/@core/entities/User.entity";
import { MergeRequestBuilder } from "../../@core/builder/MergeRequest.builder";

export class MergeRequestService {

    constructor(
        @Inject(MergeRequestRepository) private repo: MergeRequestRepository
    ) { }

    async findMerge(mergeid: number): Promise<MergeRequest> {
        return await this.repo.findOneOrFail({
            where: {
                mergeRequestId: mergeid
            },
        })
    }

    async findMergeByFather(fabricaPai: Fabrica): Promise<MergeRequest[]> {
        return this.repo.find({
            where: {
                fabrica: {
                    fabricaPai: {
                        fabricaId: fabricaPai.fabricaId
                    }
                }
            }
        });
    }


    async findMergeByFabrica(fabrica: Fabrica): Promise<MergeRequest[]> {
        return this.repo.find({
            where: {
                fabrica: {
                    fabricaId: fabrica.fabricaId
                }
            }
        });
    }


    async saveMergeComplete(merge: MergeRequest, aceite: User): Promise<MergeRequest> {
        try {
            merge.aceitoPor = aceite;
            merge.aceitaEm = new Date();
            return await this.repo.save(merge);
        } catch (error) {
            throw new InternalServerErrorException(`Problema ao gerar a merge request \n ${error.message}`)
        }
    }

    async createMerge(fabrica: Fabrica, autor: User): Promise<MergeRequest> {
        try {
            let mergeObject = new MergeRequestBuilder()
                .fabrica(fabrica)
                .feitoPor(autor)
                .build();
            mergeObject = this.repo.create(mergeObject);
            return await this.repo.save(mergeObject);
        } catch (error) {
            throw new InternalServerErrorException(`Problema ao gerar a merge request \n ${error.message}`)
        }
    }
}