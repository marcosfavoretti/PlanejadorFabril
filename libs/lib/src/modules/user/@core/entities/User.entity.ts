import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Type } from "class-transformer";
import { IsDate, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @ApiProperty()
    @IsString()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @IsString()
    @Column()
    name: string;

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
    @Column({ nullable: true, select: false })
    avatar: string;

    @ApiProperty()
    @IsDate()
    // @Column({
    //     default: () => `DATETIME('now', 'localtime')`,
    //     type: 'datetime'
    // })
    @CreateDateColumn()
    created: Date;
}