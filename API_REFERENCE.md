# ClawNexus API Reference

**中文名**: 灵魂移植器  
**English Name**: ClawNexus  
**Base URL**: `http://localhost:3000/api/v1`  
**Version**: 1.0  
**Last Updated**: March 7, 2026

---

## Authentication

All endpoints except `/health` and `/souls` require API key authentication.

### Header
```
x-api-key: {your-api-key}
```

### Demo Key
```
demo-key-123
```

### Key Expiration
- **Validity Period**: 12 hours
- **Auto-renewal**: No (new key required after expiration)
- **Revocation**: Supported

---

## Endpoints

### 1. Health Check
Check if the server is running.

**Endpoint**: `GET /api/health`
**Auth**: Not required
**Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-03-07T10:30:00.000Z"
}
```

---

### 2. Validate API Key
Verify if an API key is valid.

**Endpoint**: `POST /api/v1/keys/validate`
**Auth**: Not required (key in header)
**Headers**:
```
x-api-key: {key}
```
**Response**:
```json
{
  "valid": true,
  "message": "API key is valid"
}
```

---

### 3. List Celebrity Souls
Get all available celebrity souls.

**Endpoint**: `GET /api/v1/souls`
**Auth**: Not required
**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "musk",
      "name": "Elon Musk",
      "nameZh": "埃隆·马斯克",
      "archetype": "Visionary Entrepreneur",
      "description": "Visionary entrepreneur focused on first principles thinking..."
    },
    {
      "id": "jobs",
      "name": "Steve Jobs",
      "nameZh": "史蒂夫·乔布斯",
      "archetype": "Design Innovator",
      "description": "Design-focused innovator with obsession for simplicity..."
    }
    // ... more souls
  ],
  "count": 10
}
```

---

### 4. Get Specific Soul
Get detailed information about a specific celebrity soul.

**Endpoint**: `GET /api/v1/souls/:soulId`
**Auth**: Not required
**Parameters**:
- `soulId` (string): Soul identifier (e.g., "musk", "jobs")

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "musk",
    "name": "Elon Musk",
    "nameZh": "埃隆·马斯克",
    "archetype": "Visionary Entrepreneur",
    "description": "...",
    "personality": {
      "traits": ["Ambitious", "Innovative", "Risk-taker"],
      "coreCharacteristics": "..."
    },
    "languageStyle": {
      "tone": "Direct and casual",
      "patterns": ["First principles", "Ambitious goals"],
      "catchphrases": ["Make it work", "Scale fast"]
    },
    // ... more fields
  }
}
```

---

### 5. Generate Agent Configuration ⭐
Generate complete OpenClaw agent configuration files.

**Endpoint**: `POST /api/v1/agents/generate`
**Auth**: Required
**Headers**:
```
Content-Type: application/json
x-api-key: {your-api-key}
```

**Request Body**:
```json
{
  "soulId": "musk",
  "agentName": "Elon Agent",
  "customizations": {}
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "configId": "550e8400-e29b-41d4-a716-446655440000",
    "agentId": "agent-550e8400-e29b-41d4-a716-446655440000",
    "soulId": "musk",
    "agentName": "My Elon Agent",
    "files": {
      "SOUL.md": "---\ntitle: \"My Elon Agent\"\n...",
      "IDENTITY.md": "---\ntitle: \"My Elon Agent 身份\"\n...",
      "TOOLS.md": "---\ntitle: \"My Elon Agent 工具配置\"\n...",
      "MEMORY.md": "---\ntitle: \"My Elon Agent 记忆库\"\n...",
      "COLLABORATION.md": "---\ntitle: \"多Agent协作协议\"\n..."
    },
    "generatedAt": "2026-03-07T10:30:00.000Z",
    "expiresAt": "2026-03-07T22:30:00.000Z",
    "status": "ready_for_deployment"
  }
}
```

**Parameters**:
- `soulId` (string, required): Celebrity soul ID
- `agentName` (string, required): Name for the generated agent
- `customizations` (object, optional): Custom overrides for configuration

**Error Responses**:
```json
{
  "success": false,
  "error": "soulId is required"
}
```

---

### 6. Get Agent Status
Check the status of a generated agent configuration with deployment history.

**Endpoint**: `GET /api/v1/agents/:agentId/status`
**Auth**: Required
**Headers**:
```
x-api-key: {your-api-key}
```

**Parameters**:
- `agentId` (string): Agent configuration ID from generation response

**Response**:
```json
{
  "success": true,
  "data": {
    "configId": "550e8400-e29b-41d4-a716-446655440000",
    "agentId": "agent-550e8400-e29b-41d4-a716-446655440000",
    "soulId": "musk",
    "agentName": "My Elon Agent",
    "status": "ready_for_deployment",
    "createdAt": "2026-03-07T10:30:00.000Z",
    "expiresAt": "2026-03-08T10:30:00.000Z",
    "deployment": {
      "id": "dep-550e8400-e29b-41d4-a716-446655440001",
      "status": "success",
      "targetSystem": "openclaw",
      "result": { "message": "Deployed successfully" },
      "deployedAt": "2026-03-07T10:35:00.000Z"
    }
  }
}
```

---

### 7. List User's Agents
Get all agent configurations created by the authenticated user.

**Endpoint**: `GET /api/v1/agents`
**Auth**: Required
**Headers**:
```
x-api-key: {your-api-key}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "configId": "550e8400-e29b-41d4-a716-446655440000",
      "agentId": "agent-550e8400-e29b-41d4-a716-446655440000",
      "soulId": "musk",
      "agentName": "My Elon Agent",
      "status": "ready_for_deployment",
      "createdAt": "2026-03-07T10:30:00.000Z",
      "expiresAt": "2026-03-08T10:30:00.000Z"
    },
    {
      "configId": "550e8400-e29b-41d4-a716-446655440002",
      "agentId": "agent-550e8400-e29b-41d4-a716-446655440002",
      "soulId": "jobs",
      "agentName": "Steve Jobs Agent",
      "status": "ready_for_deployment",
      "createdAt": "2026-03-07T09:00:00.000Z",
      "expiresAt": "2026-03-08T09:00:00.000Z"
    }
  ],
  "count": 2
}
```

---

### 8. Create Deployment
Create a deployment record for an agent configuration.

**Endpoint**: `POST /api/v1/deployments`
**Auth**: Required
**Headers**:
```
Content-Type: application/json
x-api-key: {your-api-key}
```

**Request Body**:
```json
{
  "configId": "550e8400-e29b-41d4-a716-446655440000",
  "targetSystem": "openclaw"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "deploymentId": "dep-550e8400-e29b-41d4-a716-446655440001",
    "configId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "pending",
    "targetSystem": "openclaw",
    "createdAt": "2026-03-07T10:35:00.000Z"
  }
}
```

---

### 9. Get Deployment Status
Check the status of a deployment.

**Endpoint**: `GET /api/v1/deployments/:deploymentId`
**Auth**: Required
**Headers**:
```
x-api-key: {your-api-key}
```

**Parameters**:
- `deploymentId` (string): Deployment ID from creation response

**Response**:
```json
{
  "success": true,
  "data": {
    "deploymentId": "dep-550e8400-e29b-41d4-a716-446655440001",
    "configId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "success",
    "targetSystem": "openclaw",
    "result": {
      "message": "Deployed successfully",
      "path": "/path/to/agent"
    },
    "createdAt": "2026-03-07T10:35:00.000Z",
    "updatedAt": "2026-03-07T10:36:00.000Z"
  }
}
```

---

### 10. Get Database Statistics
Get system statistics (admin endpoint).

**Endpoint**: `GET /api/v1/stats`
**Auth**: Required
**Headers**:
```
x-api-key: {your-api-key}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "users": 5,
    "api_keys": 8,
    "agent_configs": 12,
    "deployments": 3
  }
}
```

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common Error Codes

| Status | Error | Cause |
|--------|-------|-------|
| 400 | `soulId is required` | Missing required parameter |
| 400 | `API key required in x-api-key header` | Missing API key header |
| 400 | `configId and targetSystem are required` | Missing deployment parameters |
| 401 | `Invalid or missing API key` | Invalid or expired API key |
| 401 | `Invalid or expired API key` | API key has expired |
| 403 | `Unauthorized` | User doesn't own the resource |
| 404 | `Soul not found` | Soul ID doesn't exist |
| 404 | `Agent configuration not found` | Config ID doesn't exist |
| 404 | `Deployment not found` | Deployment ID doesn't exist |
| 500 | `Failed to generate agent configuration` | Server error during generation |
| 500 | `Failed to create deployment` | Server error during deployment creation |

---

## Usage Examples

### Example 1: List All Souls
```bash
curl http://localhost:3000/api/v1/souls
```

### Example 2: Get Specific Soul
```bash
curl http://localhost:3000/api/v1/souls/musk
```

### Example 3: Validate API Key
```bash
curl -X POST http://localhost:3000/api/v1/keys/validate \
  -H "x-api-key: demo-key-123"
```

### Example 4: Generate Agent (JavaScript)
```javascript
const response = await fetch('http://localhost:3000/api/v1/agents/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'demo-key-123'
  },
  body: JSON.stringify({
    soulId: 'musk',
    agentName: 'My Elon Agent',
    customizations: {}
  })
});

const data = await response.json();
if (data.success) {
  const configId = data.data.configId;
  console.log('Agent created:', configId);
  
  // Check status
  const statusResponse = await fetch(
    `http://localhost:3000/api/v1/agents/${configId}/status`,
    {
      headers: { 'x-api-key': 'demo-key-123' }
    }
  );
  const statusData = await statusResponse.json();
  console.log('Status:', statusData.data.status);
}
```

### Example 5: Generate and Deploy Agent (Python)
```python
import requests
import json

api_key = 'demo-key-123'
base_url = 'http://localhost:3000/api/v1'

# Generate agent
response = requests.post(
    f'{base_url}/agents/generate',
    headers={
        'Content-Type': 'application/json',
        'x-api-key': api_key
    },
    json={
        'soulId': 'musk',
        'agentName': 'My Elon Agent',
        'customizations': {}
    }
)

data = response.json()
if data['success']:
    config_id = data['data']['configId']
    print(f'Agent created: {config_id}')
    
    # Create deployment
    deploy_response = requests.post(
        f'{base_url}/deployments',
        headers={
            'Content-Type': 'application/json',
            'x-api-key': api_key
        },
        json={
            'configId': config_id,
            'targetSystem': 'openclaw'
        }
    )
    
    deploy_data = deploy_response.json()
    if deploy_data['success']:
        deployment_id = deploy_data['data']['deploymentId']
        print(f'Deployment created: {deployment_id}')
```

### Example 6: List User's Agents (cURL)
```bash
curl http://localhost:3000/api/v1/agents \
  -H "x-api-key: demo-key-123"
```

### Example 7: Get Database Statistics
```bash
curl http://localhost:3000/api/v1/stats \
  -H "x-api-key: demo-key-123"
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. In production, the following limits will be applied:

- **Default**: 1000 requests per hour per API key
- **Generation endpoint**: 100 requests per hour per API key
- **Status endpoint**: 1000 requests per hour per API key

---

## Response Format

All responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Available Soul IDs

| ID | Name | Archetype |
|----|------|-----------|
| musk | Elon Musk | Visionary Entrepreneur |
| bezos | Jeff Bezos | Customer-Obsessed Leader |
| huang | Jensen Huang | Technology Pioneer |
| grove | Andy Grove | Strategic Operator |
| nadella | Satya Nadella | Transformation Leader |
| jobs | Steve Jobs | Design Innovator |
| murakami | Takashi Murakami | Creative Visionary |
| bowie | David Bowie | Art Innovator |
| drucker | Peter Drucker | Management Theorist |
| buffett | Warren Buffett | Investment Master |

---

## Configuration Files Generated

Each agent generation produces 5 configuration files:

1. **SOUL.md** - Agent soul definition and personality
2. **IDENTITY.md** - Visual identity and role description
3. **TOOLS.md** - Tool permissions and capabilities
4. **MEMORY.md** - Memory management configuration
5. **COLLABORATION.md** - Multi-agent collaboration protocol

All files include OpenClaw-specific YAML frontmatter for seamless integration.

---

## Deployment

### Database-Backed Workflow
1. Generate agent configuration via API (stored in database)
2. Create deployment record (tracks deployment history)
3. Monitor deployment status
4. Download configuration files for manual deployment

### To OpenClaw
1. Generate agent configuration via API
2. Get the configuration files from response
3. Extract to OpenClaw skills directory
4. Restart OpenClaw

### Programmatic Deployment
```javascript
// After generation
const configId = data.data.configId;

// Create deployment record
const deployResponse = await fetch('http://localhost:3000/api/v1/deployments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'demo-key-123'
  },
  body: JSON.stringify({
    configId: configId,
    targetSystem: 'openclaw'
  })
});

const deployData = await deployResponse.json();
const deploymentId = deployData.data.deploymentId;

// Check deployment status
const statusResponse = await fetch(
  `http://localhost:3000/api/v1/deployments/${deploymentId}`,
  {
    headers: { 'x-api-key': 'demo-key-123' }
  }
);

const statusData = await statusResponse.json();
console.log('Deployment status:', statusData.data.status);
```

---

## Database Features

### Persistent Storage
- All agent configurations stored in SQLite database
- Deployment history tracked
- User data preserved across server restarts
- 24-hour expiration for generated configs

### Security
- API key validation on every protected endpoint
- User ownership verification (can't access other users' data)
- Automatic last-used timestamp updates
- Key expiration support
- SHA256 hashing for stored keys

### Performance
- 6 indexed columns for fast queries
- Transaction support for consistency
- Efficient query helpers
- Connection pooling via better-sqlite3

---

## Support

For issues or questions:
1. Check the error message in the response
2. Verify API key is correct
3. Ensure soul ID exists
4. Check server logs for detailed errors

---

**API Version**: 1.0
**Last Updated**: March 7, 2026
**Status**: Production Ready
