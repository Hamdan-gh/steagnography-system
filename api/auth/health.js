import { withHealthHandler } from '../../server/lib/http.js';
import { getAuthHealthStatus } from '../../server/authService.js';

export default withHealthHandler(getAuthHealthStatus);
