import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, OneToMany, JoinColumn, CreateDateColumn } from "typeorm";
import { Pedido } from "../../../pedido/@core/entities/Pedido.entity";
import { Setor } from "src/modules/setor/@core/entities/Setor.entity";
import { PlanejamentoSnapShot } from "src/modules/fabrica/@core/entities/PlanejamentoSnapShot.entity";
import { Item } from "src/modules/item/@core/entities/Item.entity";

@Entity()
export class Planejamento {
  @PrimaryGeneratedColumn()
  planejamentoId: number;

  @ManyToOne(() => Item, { eager: true })
  @JoinColumn({ name: 'item' })
  item: Item;

  @ManyToOne(() => Setor, { eager: true })
  @JoinColumn({ name: 'setor' })
  setor: Setor;

  @ManyToOne(() => Pedido, { eager: true })
  @JoinColumn({ name: 'pedidoId' })
  pedido: Pedido;

  // @Column({
  //   type: 'datetime',
  //   transformer: {
  //     to(value: Date): string {
  //       const iso = value.toISOString();
  //       return iso.split('.')[0]
  //     },
  //     from(value: string | null): Date {
  //       return new Date(`${value}Z`)
  //     },
  //   },
  // })
  @CreateDateColumn()
  dia: Date;

  @OneToMany(() => PlanejamentoSnapShot, plan => plan.planejamento, {onDelete: 'CASCADE'})
  planejamentoSnapShot: PlanejamentoSnapShot[];

  @Column('int')
  qtd: number;

  copy(): Planejamento {
    const novo = new Planejamento();
    novo.dia = this.dia;
    novo.item = this.item;
    novo.pedido = this.pedido;
    novo.qtd = this.qtd;
    novo.setor = this.setor;
    return novo;
  }
}