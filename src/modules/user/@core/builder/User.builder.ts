import { User } from "../entities/User.entity";

export class UserBuilder {
    private id: string;
    private name: string;
    private email: string;
    private password: string;
    private avatar?: string;
    private created?: Date;

    withId(id: string): UserBuilder {
        this.id = id;
        return this;
    }

    withName(name: string): UserBuilder {
        this.name = name;
        return this;
    }

    withEmail(email: string): UserBuilder {
        this.email = email;
        return this;
    }

    withPassword(password: string): UserBuilder {
        this.password = password;
        return this;
    }

    withAvatar(avatar: string): UserBuilder {
        this.avatar = avatar;
        return this;
    }

    withCreatedDate(created: Date): UserBuilder {
        this.created = created;
        return this;
    }

    build(): User {
        if (!this.name || !this.email || !this.password) {
            throw new Error('Nome, email e senha são obrigatórios para criar um usuário.');
        }

        const user = new User();
        user.id = this.id;
        user.name = this.name;
        user.email = this.email;
        user.password = this.password;
        user.avatar = this.avatar || 'None';
        user.created = this.created || new Date();

        return user;
    }
}