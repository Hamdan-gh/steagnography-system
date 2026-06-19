import { withJsonHandler } from '../../server/lib/http.js';
import { verifyUserEmail } from '../../server/authService.js';

export default withJsonHandler(verifyUserEmail);
