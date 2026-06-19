import { withJsonHandler } from '../../server/lib/http.js';
import { registerUser } from '../../server/authService.js';

export default withJsonHandler(registerUser);
