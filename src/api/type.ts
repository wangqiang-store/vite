export interface roleParams {
  id?: number;
  name: string;
  isEnable?: boolean;
  remark?: string;
}

export interface searchRoleParams {
  content?: string;
  limit: number;
  page: number;
}

export interface updateRoleModuleParams {
  addList: Array<number>;
  delList: Array<number>;
  roleId: number | null;
}

export interface searchUserParams {
  content?: string;
  limit: number;
  page: number;
}

export interface userParams {
  id?: number;
  username?: string;
  name: string;
  password?: string;
  roleId: number | null;
  dept?: string;
  isEnable: boolean;
  phone?: string;
  [key: string]: any;
}

export interface searchLogParams {
  content?: string;
  startTime?: string;
  endTime?: string;
  limit: number;
  page: number;
}
