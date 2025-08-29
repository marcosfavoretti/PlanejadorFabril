import { Inject } from "@nestjs/common";
import { FabricaRepository } from "../repository/Fabrica.repository";
import { Fabrica } from "../../@core/entities/Fabrica.entity";
import { User } from "@libs/lib/modules/user/@core/entities/User.entity";

export class FabricaService {
    constructor(
        @Inject(FabricaRepository) private fabricaRepository: FabricaRepository
    ) { }

    async saveFabrica(fabrica: Fabrica): Promise<Fabrica> {
        try {
            return await this.fabricaRepository.save(fabrica);
        } catch (error) {
            console.error('Erro ao salvar fábrica:', error);
            throw error;
        }
    }

    async removerFabrica(fabrica: Fabrica): Promise<void> {
        try {
            await this.fabricaRepository.softDelete({
                fabricaId: fabrica.fabricaId
            })
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async consultarFabricasAteCheckPoint(fabrica: Fabrica, acumulado: Fabrica[] = []): Promise<Fabrica[]> {
        try {
            const fabricaAtual = await this.fabricaRepository.findOne({
                where: { fabricaId: fabrica.fabricaId },
                relations: ['fabricaPai'], // precisa garantir que o pai está carregado
            });

            if (!fabricaAtual) {
                throw new Error("Não achou o pai");
            }

            acumulado.push(fabricaAtual);

            if (fabricaAtual.checkPoint || !fabricaAtual.fabricaPai) {
                return acumulado;
            }

            return this.consultarFabricasAteCheckPoint(fabricaAtual.fabricaPai, acumulado);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async consultaFabricasDoUsuario(usuario: User): Promise<Fabrica[]> {
        return await this.fabricaRepository.find({
            where: {
                user: {
                    id: usuario.id
                }
            },
            relations: {
                user: true,
                fabricaPai: true,
            }
        });
    }

    // private checkFabricaCheckPoint(fabrica: Fabrica): Promise<number> {
    //     const fabricas = await this.
    // }

    async consultaFabrica(fabricaId: string): Promise<Fabrica> {
        return await this.fabricaRepository.findOneOrFail({
            where: {
                fabricaId: fabricaId
            },
            relations: {
                fabricaPai: true,
                user: true,
                mercadoSnapShots: true
            }
        })
    }

    createFabrica(fabrica: Partial<Fabrica>): Fabrica {
        return this.fabricaRepository.create(fabrica);
    }

    // async forkUltimaFabrica(autor: User, principal: boolean): Promise<Fabrica> {
    //     try {
    //         const ultimaFabrica = await this.consultaFabricaPrincipal();
    //         if (!ultimaFabrica) throw new Error('não foi possível consultar a ultima fabrica principal')
    //         return this.createFabrica(
    //             new FabricaBuilder()
    //                 .checkPoint(false)
    //                 .fabricaPai(ultimaFabrica)
    //                 .principal(principal)
    //                 .userId(autor)
    //                 .build()
    //         );
    //     } catch (error) {
    //         throw new Error('Nao foi possível criar um fork para a fabrica');
    //     }
    // }

    async consultaFabricaPrincipal(): Promise<Fabrica | null> {
        try {
            const results = await this.fabricaRepository.find({
                where: {
                    principal: true
                },
                order: {
                    date: 'DESC'
                },
                relations: {
                    fabricaPai: true,
                    user: true
                },
                take: 1,
            });
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}