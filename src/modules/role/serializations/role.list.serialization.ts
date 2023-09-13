import { faker } from '@faker-js/faker';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';
import { RoleGetSerialization } from './role.get.serialization';

export class RoleListSerialization extends OmitType(RoleGetSerialization, [
    'permissions','createdAt','deletedAt', 'updatedAt', 'isActive'
] as const) {
    @ApiProperty({
        description: 'Count of permissions',
        example: faker.random.numeric(2, { allowLeadingZeros: false }),
        required: true,
    })


    @Exclude()
    readonly deletedAt?: Date;

    @Exclude()
    readonly createdAt?: Date;

    @Exclude()
    readonly updatedAt?: Date;

    @Exclude()
    readonly permissions?: Date;


    @Exclude()
    readonly isActive?: Date;
    
    
        
    // @Transform(({ value }) => value.length)
    // readonly permissions: number;
}
