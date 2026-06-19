import { withJsonHandler } from '../../server/lib/http.js';
import { verifyUserEmail } from '../../authService.js';

export default withJsonHandler(verifyUserEmail);
