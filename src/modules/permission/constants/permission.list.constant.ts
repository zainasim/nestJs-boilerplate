import { ENUM_PERMISSION_GROUP } from 'src/modules/permission/constants/permission.enum.constant';

export const PERMISSION_DEFAULT_SORT = 'createdAt@asc';
export const PERMISSION_DEFAULT_PER_PAGE = 20;
export const PERMISSION_DEFAULT_AVAILABLE_SORT = ['code', 'name', 'createdAt'];
export const PERMISSION_DEFAULT_AVAILABLE_SEARCH = ['code', 'name'];
export const PERMISSION_DEFAULT_IS_ACTIVE = [true, false];
export const PERMISSION_DEFAULT_GROUP = Object.values(ENUM_PERMISSION_GROUP);
