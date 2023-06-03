import { EntitySchema } from "typeorm";

export const UserEntity = new EntitySchema<{
  id: string,
  name: string,
}>({
  name: "category",
  columns: {
    id: {
      type: String,
      primary: true,
      generated: 'uuid',
    },
    name: {
      type: String,
    },
  },
})