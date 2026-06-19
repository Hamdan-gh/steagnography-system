import { withJsonHandler } from '../../server/lib/http.js';
import { registerUser } from '../../authService.js';

export default withJsonHandler(registerUser);
