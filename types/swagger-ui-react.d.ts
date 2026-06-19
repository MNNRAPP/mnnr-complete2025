declare module 'swagger-ui-react' {
  import * as React from 'react';
  export interface SwaggerUIProps {
    url?: string;
    spec?: object;
    docExpansion?: 'list' | 'full' | 'none';
    deepLinking?: boolean;
    [key: string]: unknown;
  }
  const SwaggerUI: React.FC<SwaggerUIProps>;
  export default SwaggerUI;
}
