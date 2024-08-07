import { remark } from 'remark';
import { VFile } from 'vfile';
import { reporter } from 'vfile-reporter';
import { VFileMessage } from 'vfile-message';

const isMdValid = async (fileContent: string, vfile: VFile) => {
  try {
    const processor = remark();
    await processor.process(vfile);

    return { valid: true };
  } catch (error) {
    const vfileError = error as VFileMessage;
    vfile.message(vfileError.message, vfileError.place);

    return { valid: false, error: reporter([vfile]) };
  }
};

export default isMdValid;
