declare module "cassandra-driver" {
    
    interface IClient {
        constructor(options: IClientOptions)
        
        hosts : IHostMap;
        keyspace : string;
        metadata : Metadata;
        
        batch(queries : string[], options?: IQueryOptions, callback?: (error: Error, result: IResultSet)=>void);
        connect(callback : ()=>void);
        eachRow(query : string, params?: Object[], options?: IQueryOptions, rowCallback?: (index, row)=> void, callback?: (error, result)=>void);
        execute(query: string, params?: Object[], options?: IQueryOptions, callback?: (error: Error, result: IResultSet)=>void); 
        getReplicas(keyspace: string, token: any /*buffer*/): Object[];
        shutdown(callback?: (error)=>void);
        
    }
    
    interface IHost {
        address : string;
        cassandraVersion: string;
        datacenter : string;
        rack: string;
        tokens: string[];
        
        conBeConsideredAsUp():boolean;
        getCassandraVersion(): number[];
        isUp(): boolean;
    }
    
    interface IHostMap /*extends events.EventEmitter*/ {
        forEach(callback: (element: any)=>void);
        get(key: string): IHost;
        keys(): string [];
        remove(key: string);
    }
    
    interface IQueryOptions {
        hints?: string[] | string[]; //the doc doesnt say optional, but it seems fine in practice.
        autoPage?: boolean;
        captureStackTrace?: boolean;
        consistency?: number;
        customPayload?: Object;
        fetchSize?: number;
        logged?: boolean;
        pageState?: any /*buffer*/ | string;
        prepare?: boolean;
        readTimeout?: number;
        retry?: IRetryPolicy;
        routingIndexes?: number[];
        routingNames?: string[];
        serialConsistency?: number;
        timestamp?: number
        traceQuery?: boolean;
    }
    
    interface IClientOptions {
        constructor();
        
        contactPoints: string[];
        keyspace: string;
        policies: Object; //needs to be broken out
        queryOptions: IQueryOptions;
        pooling: Object;
        protocolOptions: Object;
        socketOptions: Object; //needs to be broken out
        autoProvider: IAuthProvider;
        sslOption: Object; //needs to be broken out
    }
    
    interface IResultSet {
        constructor(response: Object, host: string, triedHosts: Object, consistency: number);
        
        info : Object; //this probably should have a type too
        pageState: string;
        rowLength: number;
        rows: IRow[];
        
        first(): IRow;
        nextPage()
    }
    
    interface IRow {
        constructor(columns: any[]);
        
        forEach(callback:(row)=>void);
        get(columnName: string | number);
        keys(): string[];
        values(): Object[];
    }
    
    interface IRetryPolicy {
        retryDecision: Object;
        
        onReadTimeout(requestInfo: Object, consistency: number, received: number, blockFor: any, isDataPresent: boolean): DecisionInfo;
        onUnavailable(requestInfo: Object, consistency: number, received: number, blockFor: any, isDataPresent: boolean): DecisionInfo;
        onWriteTo(requestInfo: Object, consistency: number, received: number, blockFor: any, isDataPresent: boolean): DecisionInfo;
        rethrowResult(): Object;
        retryResult(): Object;
        
    }
    
    interface DecisionInfo {
        
    }
    
    interface Metadata {
        constructor(options: IClientOptions, controlConnection: Object /*may be an object, I see no definition in the docs*/)
        
        clearPrepared();
        getAggregate(keyspaceName: string, name: string, signature: string[], callback: (error, Object)=>void);
        getAggregates(keyspaceName: string, name: string, callback: (error, any)=>void);
        getFunction(keyspaceName: string, name: string, signature, callback : (error: ISchemaFunction)=>void);
        getFunctions(keyspaceName: string, name: string, signature, callback : (error: ISchemaFunction[])=>void);
        getMaterializedView(keyspaceName: string, name: string, callback: (error, MaterializedView)=>void);
        getReplicas(keyspaceName: string, tokenBuffer: any /*buffer*/): Object[];
        getTable(keyspaceName: string, name: string, callback: (error, TableMetadata)=>void);
        getTrace(traceId: string /*uuid*/, callback: (error, Object)=>void);
        getUdt(keyspaceName: string, name: string, callback: ()=>void);
        refreshKeyspace(keyspaceName: string, callback: (any)=>void);
        refreshKeyspaces(callback: (any)=>void);
    }
    
    interface ISchemaFunction {
        argumentName: string[];
        argumentTypes: Object[];
        body: string;
        calledOnNullInput: boolean;
        keyspaceName: string;
        language: string;
        returnType: Object;
        signature: string[];
    }
    
    /*abstract in docs*/
    interface IAuthProvider {
        newAuthenticator(endpoint: string, name: string): IAuthenticator;
    }
    
    interface IAuthenticator {
        evaluateChallenge(challenge: any /*buffer*/, callback:(any)=>void);
        initialResponse(callback: (any)=>void);
        onAuthenticationSuccess(token: any /*buffer*/);
    }
    
    var Client: any; //more work to do
}