import { GerenciaCargo } from "@libs/lib/modules/cargos/@core/entities/GerenciaCargo.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";
import { IsDate, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {

    @Expose()
    @ApiProperty()
    @IsString()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Expose()
    @ApiProperty()
    @IsString()
    @Column()
    name: string;

    @Expose()
    @ApiProperty()
    @IsString()
    @Column('varchar')
    email: string;

    @Column('varchar', { select: false })
    @ApiProperty()
    @IsString()
    @Exclude()
    password: string;


    @ApiProperty()
    @IsString()
    @Column({ nullable: true, select: true })
    @Expose()
    avatar: string;

    // @Column({
    //     default: () => `DATETIME('now', 'localtime')`,
    //     type: 'datetime'
    // })

    @Expose()
    @ApiProperty()
    @IsDate()
    @CreateDateColumn()
    created: Date;

    @Exclude()
    @OneToMany(() => GerenciaCargo, (gerencia) => gerencia.user, { eager: true, cascade: ['insert'] })
    cargos: GerenciaCargo[];

    @Expose()
    @Transform(({ obj }) => obj.cargos?.map(c => c.cargo?.nome) ?? [])
    cargosLista: string[];
}