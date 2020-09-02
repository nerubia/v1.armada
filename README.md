# Armada

Serverless API based off serverless.com.

### Why Armada?

- Just don't want to deal with servers any more.
- AWS Lambdas are super cheap compared to EC2 containers running your microservices.
- Who doesn't love the microservices architecture? It's the way to go these days.

#### Definition of armada

> 1 : a fleet of warships
> 2 : a large force or group usually of moving things

## Setup

Install node packages

```
yarn
```

(Optional but recommended) run unit tests

```
npm test
```

**(Important)** before you start creating your other microservices, instantiate the  
`/sitrep` API endpoint.

This builds the API Gateway domain that will be shared across your microservices.

```
# Go to the /sitrep service located in services/general
cd services/general

# Deploy the microservice thus allowing AWS to create your API Gateway
npm run deploy
```

## Start hacking!

```
# Create (and name) your service
NAME=flights npm run create
```

## Dev mode

For DX, a mock gateway middleware using Kastle is available for use.  
To add your lambda function as route, create a Kastle route directory in `src/gateway/routes`.  
For example, assuming that you've created the blog-posts lambda microservice:

**File:** `./src/gateway/routes/blog-posts/index.ts`

```
import {
  lambdaMiddleware,
  MethodTypes,
  KastleRouter,
  KastleRoutes,
} from '@g-six/kastle-router'
import { list, retrieve } from 'services/blog-posts/handler'

const baseUrl = '/pages'

const routes: KastleRoutes = {
  retrieve: {
    method: MethodTypes.Get,
    route: '/:blog_id',
    middlewares: [lambdaMiddleware(retrieve)],
  },
  list: {
    method: MethodTypes.Get,
    route: '/',
    middlewares: [lambdaMiddleware(list)],
  },
}

export const Route: KastleRouter = {
  baseUrl,
  routes,
}
```

### Modify the file:

`./src/gateway/routes/index.ts`

```
import ...
...
import { Route as Sitrep } from './general'
import { Route as BlogPosts } from './blog-posts'

...

export const loadServices = (app: Koa) => {
  loadRoutes(app)(Sitrep)
  loadRoutes(app)(BlogPosts)
}
```

## Caveats

When running on dev mode, ensure that none of your services have `node_modules` directories in them.  
Otherwise there's bound to be conflicts in AWS configs.  
Example error:

```
aws-sdk Missing region in config
```

## Deployment of micro-services

Armada is based on the serverless framework and our team take advantage of this by deploying our micro-services to AWS API Gateway.

#### TL;DR

##### Step 1

```
cd src/services/general
npm run deploy
```

##### Step 2 (Optional)

###### Step 2-a

Update the API Gateway configuration

```
aws apigateway create-domain-name \
    --domain-name 'your.armada-api.domain' \
    --endpoint-configuration types=REGIONAL \
    --regional-certificate-arn 'arn:aws:acm:ap-southeast-1:123456789012:certificate/c19332f0-3be6-457f-a244-e03a423084e6'
```

If successful, the call returns a result similar to the following:

```
{
    "certificateUploadDate": "2017-10-13T23:02:54Z",
    "domainName": "your.armada-api.domain",
    "endpointConfiguration": {
        "types": "REGIONAL"
    },
    "regionalCertificateArn": "arn:aws:acm:us-west-2:123456789012:certificate/c19332f0-3be6-457f-a244-e03a423084e6",
    "regionalDomainName": "d-numh1z56v6.execute-api.ap-southeast-1.amazonaws.com"
}
```

The `regionalDomainName` property value returns the regional API's host name. You must create a DNS record to point your custom domain name to this regional domain name. This enables the traffic that is bound to the custom domain name to be routed to this regional API's host name.

###### Step 2-b

Add a base path mapping to expose the specified API (for example, 0qzs2sy7bh) in a deployment stage (for example, dev) under the specified custom domain name (for example, your.armada-api.domain).

```
aws apigateway create-base-path-mapping \
    --domain-name 'your.armada-api.domain' \
    --base-path 'dev' \
    --rest-api-id 0qzs2sy7bh \
    --stage 'dev'
```

# Team

Looking for a team of **coffee-loving, cuddly, and otherworldly** super geeks to help  
you with your projects?  
E-mail code@idearobin.com and let's launch your ideas into the digital space! :rocket:

```
Run alone you go fast
Run together you go far
```

| Maintainer(s)                     | Pay us a [visit](https://www.idearobin.com)! |
| --------------------------------- | :------------------------------------------: |
| [g-six](https://github.com/g-six) |              ![alt text][team]               |

[team]: https://greatives.s3.ap-southeast-1.amazonaws.com/images/team.png 'The team'
