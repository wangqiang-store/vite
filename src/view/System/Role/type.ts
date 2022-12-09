export interface TableRow {
  id?: number;
  name: string;
  remark?: string;
  isEnable?: boolean;
  [key: string]: any;
}

export interface Tree {
  id: number;
  label: string;
  children?: Tree[];
}
