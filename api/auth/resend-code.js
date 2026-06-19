import { withJsonHandler } from '../../server/lib/http.js';
import { resendVerificationCode } from '../../authService.js';

export default withJsonHandler(resendVerificationCode);
