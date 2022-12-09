export interface userStoreState {
  userInfo: {
    id?: number | undefined;
    roleId?: number | undefined;
    [key: string]: any;
  };
}
export interface commonStoreType {
  experimentStatusList: Array<any>;
  experimentFilterList: Array<any>;
}

export interface useModuleStoreState {
  roleRouter: Array<any>;
  currmentUserId: Array<number>;
  moduleData: Array<any>;
}

type ShareLike = {
  url: string;
  id: number | null;
};

export interface useShareStoreState {
  shareLike: ShareLike;
}
