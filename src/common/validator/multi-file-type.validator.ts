import { FileValidator, Injectable } from '@nestjs/common';

interface MultiFileTypeValidatorOptions {
  fileTypes: string[];
}

@Injectable()
export class MultiFileTypeValidator extends FileValidator<MultiFileTypeValidatorOptions> {
  constructor(options: MultiFileTypeValidatorOptions) {
    super(options);
  }

  isValid(file: Express.Multer.File): boolean {
    if (!file) return false;
    return this.validationOptions.fileTypes.includes(file.mimetype);
  }

  buildErrorMessage(): string {
    return `file type must be one of [${this.validationOptions.fileTypes.join(', ')}]`;
  }
}
