export interface ServerInfo {
  chatId?: string | number;
  hostname: string;
  port: number
}

export interface ServerResponse {
  online: boolean;
  ip: string;
  port: number;
  hostname?: string;
  debug: {
    ping: boolean;
    query: boolean;
    bedrock: boolean;
    srv: boolean;
    querymismatch: boolean;
    ipinsrv: boolean;
    cnameinsrv: boolean;
    animatedmotd: boolean;
    cachehit: boolean;
    cachetime: number;
    cacheexpire: number;
    apiversion: number;
  };
  version?: string;
  protocol?: {
    version: number;
    name?: string;
  };
  icon?: string;
  software?: string;
  map?: {
    raw: string;
    clean: string;
    html: string;
  };
  gamemode?: string;
  serverid?: string;
  eula_blocked?: boolean;
  motd: {
    raw: string[];
    clean: string[];
    html: string[];
  };
  players: {
    online: number;
    max: number;
  };
}

export interface PingResult {
  error: boolean | string;
  data: {
    online: boolean;
    has_players: boolean;
    players: string[];
    other_data: ServerResponse | null
  }
}