# Clusters Inspector
* node
* react 
* node:cluster
* koa

###### v 1.0.0

This is a POC based on my node-react minimalist framework. This is another environment to test clusters in node.

You can test the api layer with an Api client, but the simple react client created here will do the job. 

I can imagine adding some more metrics (order or response, sorting etc.) to the client.

Also all my tests are in a windows environment which is a no no for node clusters. I will have to test it in a Linux environment sometime. Anyways.

The calls used here to engage the server and their main characteristics are discussed here:

shortCall should take 5 seconds to complete and is is not a CPU intensive call. It is a simple setTimeout.
```
localhost:3000/shortCall
```

longCall is very similar to shortCall but it takes 10 seconds to complete.
```
localhost:3000/longCall
```

heavyCall is a CPU intensive call. It takes around 40 seconds on my system and will block the node thread.
```
localhost:3000/heavyCallAsync
```
### Tests

I intentionally set the number of forks created to be 4 or less if system does have less logical processors. Once you run the project you can see the pID of the processes created in the console:

![Console logs](https://github.com/babak2000ir/node-clusters/blob/main/Screenshot%202023-08-14%20203155.jpg?raw=true)

##### **First Test:**

For the first test I straight up called 6 heavyCalls. Result is straight forward. nodejs/OS utilize 3 forks to run these calls so first call on each pID takes around 40 seconds and subsequent call take twice as much.

Any tests with more calls strangely results in utilization of only three forks, I could not force the fourth node to be used in heavyCall tests.

![Console logs](https://github.com/babak2000ir/node-clusters/blob/main/Screenshot%202023-08-14%20203240.jpg?raw=true)

Using cluster.schedulingPolicy = cluster.SCHED_RR; to force round robin scheduling policy on windows (Round Robin is the default scheduling policy in Linux bases operating systems) made node to use all available forks, I tested up to 6 successfully, but the response time also increased for each call.

Considering this is still a test on windows, at the end this comes down to balance between response time and queue time. Also you should consider more forks means more system resources and a more expensive plan on your host.

##### **Second Test:**

For the second test I used a mix of short and long calls, intermittent with heavy calls. The result is not satisfying at all, few anomalies are observed:

* The early short/longCalls are blocked by later heavy calls and node/OS did not utilize another core to accommodate the heavy call.
* Although I cannot expect OS/node be so smart as to predict a heavyCall coming, still you can see another call after the heavy call was made still landed in the same process. There are many synchronicity and timing issues to explain this, but still.
* Eventually as more heavy calls are mounted, system starts utilizing more forks, still the number of forks do not exceed three if default OS mode is used on windows.

![Console logs](https://github.com/babak2000ir/node-clusters/blob/main/Screenshot%202023-08-14%20203935.jpg?raw=true)

Using round robin scheduling, result is better, the earlier short/longCalls are not blocked by later heavy calls and node/OS did utilize more cores to accommodate the heavy calls.

But as soon as all cores were hit with heavy calls, wait and response time increased for all the calls, as expected.