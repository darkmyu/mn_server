import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { CursorPagination } from '../dto/cursor-pagination.dto';

export const ApiOkResponseCursorPagination = <T extends Type<unknown>>(type: T) => {
  return applyDecorators(
    ApiExtraModels(CursorPagination, type),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(CursorPagination) },
          {
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(type) },
              },
            },
            required: ['items'],
          },
        ],
      },
    }),
  );
};
