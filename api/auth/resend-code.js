import { withJsonHandler } from '../../server/lib/http.js';
import { resendVerificationCode } from '../../server/authService.js';

export default withJsonHandler(resendVerificationCode);
