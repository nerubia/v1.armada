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
npm install
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
