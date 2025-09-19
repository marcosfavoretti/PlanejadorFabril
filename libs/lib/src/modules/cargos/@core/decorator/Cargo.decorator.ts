import { SetMetadata } from '@nestjs/common';
import { CargoEnum } from '../enum/CARGOS.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: CargoEnum[]) => SetMetadata(ROLES_KEY, roles);