---
layout: showcase
title: "Enhancing TCP Fairness: TCP Vegas+ Implementation"
subtitle: "A dual-mode solution for TCP Vegas fairness issues"
category: projects
group: Projects
show: true
width: 8
date: 2022-05-15 00:00:00 +0800
excerpt: Modified TCP Vegas implementation with dynamic aggressiveness to address fairness issues when competing with TCP Reno, achieving near-perfect fairness while preserving Vegas' efficiency advantages.
thumbnail: /assets/images/projects/tcp-vegas-plus.png
featured: true
technologies:
  - C++
  - NS3
  - Networking
  - TCP/IP
  - Protocol Design
---

# Enhancing TCP Fairness: Implementing and Evaluating TCP Vegas+ in NS3

## Introduction

Network simulators provide researchers and engineers with powerful tools to test protocol modifications without affecting real-world networks. [NS3 (Network Simulator 3)](https://www.nsnam.org/) stands out as one of the most comprehensive open-source network simulators, enabling detailed analysis of transport layer protocols like TCP. Our project focused on addressing a critical fairness issue between TCP variants that has long hindered the deployment of promising protocols.

## The TCP Vegas vs Reno Fairness Problem

TCP is the backbone of our internet, handling reliable data transmission for most applications. However, not all TCP variants are created equal. The classic TCP Reno implements an aggressive congestion avoidance mechanism, rapidly increasing its congestion window until packet loss occurs. In contrast, TCP Vegas uses a more proactive approach, monitoring Round-Trip Time (RTT) variations to detect congestion before losses occur.

While Vegas offers several advantages—reduced packet loss, lower queuing delay, and greater stability—it suffers from a significant drawback when competing with Reno flows. When both variants share the same bottleneck link, Vegas' conservative approach causes it to receive significantly less bandwidth than Reno.

Our measurements showed:
- Vegas flows achieve only 22-35% of the throughput of Reno flows in mixed environments
- The Jain's Fairness Index drops to 0.68 when Vegas competes with Reno (compared to 0.92+ for homogeneous connections)
- Buffer occupancy is dominated by Reno packets (78% vs 22%) despite equal flow counts

## TCP Vegas+: A Dual-Mode Solution

We implemented TCP Vegas+, a modified version of TCP Vegas that dynamically adjusts its aggressiveness to compete fairly with Reno while preserving Vegas' inherent stability advantages. The implementation introduces:

1. **Dual operational modes**:
   - **Moderate Mode**: Preserves original Vegas behavior, ideal for steady-state operation
   - **Aggressive Mode**: Adopts Reno-like behavior when competing with aggressive flows

2. **Intelligent mode switching based on network conditions**:
   - Monitors RTT trends to detect competing aggressive flows
   - Switches to moderate mode upon congestion detection

3. **Adaptive threshold mechanism**:
   - Uses a configurable countmax parameter (default: 5) to control sensitivity
   - Prevents oscillation through hysteresis logic

## Implementation Details

The modification required surgical changes to NS3's TCP module:

```cpp
// Core logic in tcp-vegas.cc (simplified)
if (m_cntRtt > m_countMax && baseRtt > m_minRtt && !m_aggressive) {
  // Switch to aggressive mode when RTT consistently increases
  m_aggressive = true;
  NS_LOG_INFO ("Vegas: Switching to aggressive mode");
} else if (m_inFastRec && m_aggressive) {
  // Return to moderate mode after packet loss
  m_aggressive = false;
  m_cntRtt = 0;
  NS_LOG_INFO ("Vegas: Switching to moderate mode");
}
```

We modified four key files:
1. `tcp-vegas.cc` - Core algorithm modifications (194 lines changed)
2. `tcp-socket-base.cc` - Socket handling additions (83 lines changed)
3. `tcp-socket-base.h` - Interface declarations (35 lines changed)
4. `tcp-socket-state.h` - State tracking enhancements (42 lines changed)

## Experimental Setup

We conducted extensive simulations using diverse network topologies:
- **Dumbbell topology** with multiple sending and receiving nodes
- **Point-to-point links** with 20Mbps bandwidth and 5ms delay
- **Bottleneck link** with varying buffer sizes (50-500 packets)
- **Mixed flow configurations** with 2-20 concurrent connections

Parameters varied:
- Number of TCP flows (2, 5, 10, 15, 20)
- Flow type ratios (Reno:Vegas+)
- Bottleneck buffer sizes
- Simulation duration (30-300 seconds)

All simulations were repeated 10 times with different random seeds to ensure statistical validity.

## Results and Performance Metrics

### 1. Fairness Improvement

The Jain's Fairness Index (JFI) improved significantly:

<div class="table-responsive mb-3">
    <table class="table table-bordered">
        <thead class="table-light">
            <tr>
                <th>Scenario</th>
                <th>Original Vegas vs Reno</th>
                <th>Vegas+ vs Reno</th>
                <th>Improvement</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>2 flows</td><td>0.68</td><td>0.89</td><td>30.9%</td></tr>
            <tr><td>5 flows</td><td>0.72</td><td>0.91</td><td>26.4%</td></tr>
            <tr><td>10 flows</td><td>0.75</td><td>0.93</td><td>24.0%</td></tr>
            <tr><td>15 flows</td><td>0.77</td><td>0.94</td><td>22.1%</td></tr>
            <tr><td>20 flows</td><td>0.79</td><td>0.95</td><td>20.3%</td></tr>
        </tbody>
    </table>
</div>

### 2. Throughput Analysis

Vegas+ achieved competitive throughput without sacrificing network efficiency:

<div class="table-responsive mb-3">
    <table class="table table-bordered">
        <thead class="table-light">
            <tr>
                <th>Metric</th>
                <th>TCP Reno</th>
                <th>TCP Vegas</th>
                <th>TCP Vegas+</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>Average throughput (Mbps)</td><td>16.8</td><td>13.2</td><td>16.3</td></tr>
            <tr><td>Throughput stability (std dev)</td><td>3.2</td><td>1.5</td><td>1.8</td></tr>
            <tr><td>Bandwidth share when competing (%)</td><td>78.4</td><td>21.6</td><td>48.7</td></tr>
        </tbody>
    </table>
</div>

### 3. Network Efficiency Metrics

Vegas+ maintained Vegas' efficient use of network resources:

<div class="table-responsive mb-3">
    <table class="table table-bordered">
        <thead class="table-light">
            <tr>
                <th>Metric</th>
                <th>TCP Reno</th>
                <th>TCP Vegas</th>
                <th>TCP Vegas+</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>Avg queue occupancy (packets)</td><td>38.4</td><td>12.6</td><td>15.2</td></tr>
            <tr><td>Packet retransmissions (%)</td><td>4.8</td><td>1.2</td><td>1.9</td></tr>
            <tr><td>End-to-end delay (ms)</td><td>78.6</td><td>42.1</td><td>45.3</td></tr>
        </tbody>
    </table>
</div>

### 4. Impact of countmax Parameter

The countmax parameter provides a tunable tradeoff between fairness and efficiency:

<div class="table-responsive mb-3">
    <table class="table table-bordered">
        <thead class="table-light">
            <tr>
                <th>countmax value</th>
                <th>Fairness Index</th>
                <th>Packet Loss (%)</th>
                <th>Throughput (Mbps)</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>3</td><td>0.91</td><td>2.1</td><td>16.5</td></tr>
            <tr><td>5</td><td>0.93</td><td>1.9</td><td>16.3</td></tr>
            <tr><td>7</td><td>0.94</td><td>1.7</td><td>16.1</td></tr>
            <tr><td>10</td><td>0.95</td><td>1.4</td><td>15.8</td></tr>
        </tbody>
    </table>
</div>

### 5. Performance Across Different Environments

Vegas+ demonstrated robust performance across different network conditions:

<div class="table-responsive mb-3">
    <table class="table table-bordered">
        <thead class="table-light">
            <tr>
                <th>Network Type</th>
                <th>Fairness Improvement</th>
                <th>Bandwidth Utilization</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>Wired (P2P links)</td><td>26.4%</td><td>97.8%</td></tr>
            <tr><td>Wireless (802.11n)</td><td>18.7%</td><td>94.2%</td></tr>
            <tr><td>High delay (100ms)</td><td>24.1%</td><td>96.3%</td></tr>
            <tr><td>Variable bandwidth</td><td>25.3%</td><td>95.9%</td></tr>
        </tbody>
    </table>
</div>

## Conclusions and Implications

Our implementation of TCP Vegas+ successfully addresses the long-standing fairness issues that have limited the deployment of TCP Vegas, while preserving its core benefits. The key achievements include:

1. **Near-perfect fairness**: Improved Jain's Fairness Index from 0.68 to 0.93 (average)
2. **Competitive throughput**: Achieved 97% of Reno's throughput while maintaining Vegas' stability
3. **Preserved efficiency**: Maintained low queue occupancy (15.2 packets) and reduced packet loss (1.9%)
4. **Tunable behavior**: Countmax parameter allows for network-specific optimization

Most importantly, Vegas+ demonstrates that it's possible to maintain the proactive congestion control advantages of delay-based TCP variants while addressing their competitive disadvantages. This opens the door for wider deployment of these algorithms in real-world networks, potentially reducing global internet congestion.

Future work will focus on testing Vegas+ in larger topologies, implementing the algorithm in the Linux kernel, and exploring its performance in data center environments where small queuing delays are critical.

## Acknowledgments

This research was conducted as part of the CSE-322 Computer Networks Sessional course at BUET. The authors would like to thank the course instructors for their guidance and the NS3 community for their comprehensive documentation and support.

The complete project code and documentation is available on [GitHub](https://github.com/thromel/CSE-322-Computer-Networks-Sessional).

## Network Researcher | 8-week Project | Protocol Implementation

<div class="text-end mb-3">
    <a href="https://github.com/thromel/CSE-322-Computer-Networks-Sessional" target="_blank" class="btn btn-sm btn-outline-dark">
        <i class="fab fa-github"></i> View on GitHub
    </a>
</div> 