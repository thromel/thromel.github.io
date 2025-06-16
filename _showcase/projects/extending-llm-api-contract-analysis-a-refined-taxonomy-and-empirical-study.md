---
layout: showcase
title: "Making AI Reliable: Design by Contract for Large Language Models"
subtitle: "A Refined Taxonomy and Empirical Study of LLM API Contracts"
category: projects
group: Research
show: true
width: 8
date: 2025-01-15 00:00:00 +0800
excerpt: An in-depth exploration of applying "Design by Contract" principles to Large Language Models, offering a comprehensive taxonomy, detection methods, and enforcement strategies to make AI systems more reliable and predictable.
thumbnail: /assets/images/llm-api-taxonomy.png
featured: true
technologies:
  - LLM Systems
  - API Design
  - Software Engineering
  - Artificial Intelligence
  - Python
---

# Making AI Reliable: Design by Contract for Large Language Models

<img src="{{ 'assets/images/llm-api-taxonomy.png' | relative_url }}" class="img-fluid mb-4 rounded shadow-sm" alt="LLM API Taxonomy">

In the world of traditional software development, engineers have long relied on a methodology called "Design by Contract" to build reliable systems. This approach clearly defines what a software component expects (preconditions), what it guarantees (postconditions), and what remains true throughout its execution (invariants). But what happens when we apply these time-tested principles to the newer, more dynamic world of Large Language Models (LLMs)?


In this post, I'll explain the key ideas behind our research, why they matter, and how they could transform the way we build AI systems.

## Why We Need Contracts for LLMs

If you've ever worked with LLM APIs (like those from [OpenAI](https://openai.com/), [Anthropic](https://www.anthropic.com/), or others), you've likely encountered some unexpected behaviors or errors:

- Your prompt was too long and got silently truncated
- The model didn't produce the JSON format you expected, causing your parser to crash
- Your content triggered a safety filter, resulting in a refusal
- Your agent got stuck in an infinite loop when the model's output format wasn't as expected

These are all examples of *contract violations* - instances where an implicit assumption about how the API should be used or what it will return was broken.

Unlike traditional APIs with clear documentation and static types, LLM APIs often have many implicit "contracts" - unstated conditions that, if violated, lead to errors or unexpected behaviors. The problem is that developers typically discover these contracts through trial and error or by scouring forum posts, rather than through explicit specifications.

## What is a "Contract" for an LLM?

An LLM contract is essentially a formal specification of what's expected when interacting with an LLM. Contracts can specify:

- **Preconditions**: What must be true before calling the LLM (e.g., "prompt length must be ≤ 4096 tokens")
- **Postconditions**: What must be true after the LLM responds (e.g., "output must be valid JSON")
- **Invariants**: What must remain true throughout interactions (e.g., "the assistant never contradicts previous statements")

Contracts make these implicit assumptions explicit and enforceable, allowing developers to catch and handle violations early.

## A Taxonomy of LLM Contracts

The research identifies several major categories of contracts for LLMs:

### 1. Input Contracts

These specify what the LLM expects as input:

- **Data Type Contracts**: For example, "messages must be a list of dictionaries with 'role' and 'content' keys" or "the temperature parameter must be a float between 0 and 2"
- **Value Constraints**: Such as "prompt length must not exceed the model's context window" or "function definitions must follow the specified JSON schema"

Input contracts are the most common type, accounting for roughly 60% of issues encountered in practice.

### 2. Output Contracts

These specify expectations about the LLM's responses:

- **Format Contracts**: For instance, "the model's output must be valid JSON following a specific schema" or "if generating code, the output must include a markdown code block"
- **Content Policy Contracts**: Such as "output must not contain harmful, unethical, or disallowed content"

Output contracts represent about 20% of observed issues and are particularly important for downstream processing of LLM outputs.

### 3. Temporal/Sequence Contracts

These specify the correct ordering of operations:

- **Initialization Contracts**: "The API key must be set before making any requests"
- **Conversation Flow Contracts**: "In a multi-turn dialogue, context from previous messages must be included"
- **Agent Loop Contracts**: "If the LLM outputs a tool call, the system must execute that tool and feed the result back to the LLM"

Sequence contracts are less frequent (about 15% of issues) but crucial for maintaining state and coherence in more complex applications.

### 4. Extended Contract Types

The second paper extends this taxonomy to include:

- **Training-Time Contracts**: Ensuring training data quality, model convergence, and proper hyperparameter settings
- **Domain-Specific Contracts**: Encoding requirements for specific fields like healthcare (e.g., "medical advice must include a disclaimer")
- **Performance Contracts**: Specifying latency and quality requirements (e.g., "response time ≤ 2 seconds for 95% of requests")
- **Security Contracts**: Preventing prompt injections and ensuring safe tool usage

<img src="{{ 'assets/images/llm-contracts-hierarchy.png' | relative_url }}" class="img-fluid mb-4 rounded shadow-sm" alt="Hierarchy of LLM Contract Types">

## How to Discover LLM Contracts

How do we identify these contracts? The papers describe several approaches:

### Manual Specification

Developers can write contracts based on their domain expertise and understanding of the LLM. This is precise but labor-intensive.

### Automated Contract Mining

More interestingly, the research proposes automated ways to discover contracts:

1. **Static Analysis**: Examining library code to find checks or error conditions that indicate contracts. For example, if the OpenAI SDK code checks `if len(prompt) > MAX_TOKENS: raise Error("Prompt too long")`, we can infer a contract that "prompt length must not exceed MAX_TOKENS."

2. **Dynamic Analysis**: Running tests and observing failures to identify boundaries. For instance, gradually increasing prompt size until the API fails to find the maximum allowed length.

3. **NLP-Based Mining**: Using NLP techniques (including LLMs themselves) to extract contract statements from documentation, forum posts, and stack traces. For example, parsing a statement like "The maximum context length is 4096 tokens" from API docs.

4. **Machine Learning Inference**: Training models to predict contract conditions from examples of function usage.

This automated mining helps reduce the burden on developers and captures community knowledge about LLM usage.

## Enforcing Contracts in Practice

Once identified, how do contracts get enforced? The papers propose a comprehensive architecture:

### Development-Time Enforcement

1. **Contract-Aware Linters**: Static analyzers that check code for potential contract violations before execution
2. **Test Generation**: Automatically generating test cases that verify contract compliance
3. **CI/CD Integration**: Running contract checks during continuous integration to catch issues early

### Runtime Enforcement

1. **Precondition Checking**: Validating inputs before sending to the LLM (e.g., checking prompt length or content)
2. **Postcondition Checking**: Validating outputs from the LLM (e.g., ensuring format compliance)
3. **Auto-Remediation**: When possible, automatically fixing issues (like truncating prompts, reformatting outputs, or re-prompting with format instructions)

### Framework Integration

The approach can be integrated with popular frameworks like [LangChain](https://www.langchain.com/) or [LlamaIndex](https://www.llamaindex.ai/):

```python
from llm_contracts.integrations import ContractLLM
from llm_contracts.contracts import JsonOutputContract, MaxTokensContract

# Create LLM with contracts
contracted_llm = ContractLLM(
    llm=OpenAI(model="gpt-4"),
    contracts=[
        MaxTokensContract(4096),
        JsonOutputContract(schema=my_schema)
    ]
)

# Use normally - contracts are enforced automatically
response = contracted_llm("Generate a summary of this document")
```

## Real-World Impact

The research included several case studies demonstrating the practical benefits:

### Medical Advice Chatbot

For a healthcare Q&A system, contracts ensured the model always:
- Included required disclaimers with any advice
- Cited sources for medical claims
- Directed users to seek professional help for emergencies

### Financial Assistant

When answering financial questions, contracts verified:
- No disallowed financial advice was given (e.g., "guaranteed" returns)
- Numerical calculations were accurate (by cross-checking results)
- Context from previous questions was maintained

### Coding Assistant

For a programming helper, contracts:
- Prevented insecure coding patterns (e.g., using MD5 for password hashing)
- Ensured generated code was syntactically valid and compilable
- Enforced style guidelines and best practices

<img src="{{ 'assets/images/llm-contract-enforcement.png' | relative_url }}" class="img-fluid mb-4 rounded shadow-sm" alt="LLM Contract Enforcement Architecture">

## Empirical Findings

The research analyzed over 600 instances of LLM API issues and found that:

- **~60%** were basic input issues (wrong types, missing fields, exceeding limits)
- **~20%** were output format or content issues
- **~15%** were temporal/sequence issues
- **~5%** were complex semantic issues

With proper contracts in place, about 95% of these issues could be caught and many automatically resolved.

Performance impact was minimal: enforcing contracts typically added only 8-15% overhead to API call latency, which is negligible compared to the time saved debugging mysterious failures.

## Implementation Considerations

The papers detail several implementation approaches:

### Contract Specification Language

A formal language (LLMCL) for specifying contracts that includes:
- First-order logic for state properties
- Temporal logic for sequence properties
- Probabilistic assertions for statistical guarantees

Contracts can be specified using:

```python
@contract
def generate_summary(title: str, content: str) -> str:
    # Preconditions
    require(len(content) > 0 and len(content) <= MAX_LEN)
    require(title is None or len(title) < 100)
    
    # Postconditions
    ensure(is_valid_json(output))
    ensure(sentence_count(output.summary) <= 3)
    
    # Probabilistic postcondition
    ensure_prob(lambda out: title in out.summary, 0.9)
    
    # Call the LLM here
    result = call_llm_api(title, content)
    return result
```

### Optimization Techniques

To minimize overhead:
- **Selective Activation**: Enabling only critical contracts in production
- **Batching Checks**: Validating multiple outputs in one pass
- **Caching**: Avoiding redundant calculations for repeated checks

## Limitations and Future Directions

The researchers acknowledge several limitations:

1. **Specification Burden**: Writing comprehensive contracts requires effort and expertise
2. **Complex Semantics**: Some properties (like factual accuracy) are hard to specify formally
3. **Model Capabilities**: If a model fundamentally can't satisfy a contract, no amount of enforcement will help

Future research directions include:

- **Learning Contracts from Data**: Using ML to automatically discover and refine contracts
- **Contract-Guided Training**: Incorporating contract compliance into model training
- **Standardization**: Developing common libraries and specifications for LLM contracts
- **Multi-Modal Extensions**: Applying similar principles to image, audio, and video models

## Why This Matters

The contract-based approach to LLM development represents a significant step toward more reliable AI systems. By making implicit assumptions explicit and enforceable, we can:

1. **Prevent Common Errors**: Catch and handle violations before they cause system failures
2. **Improve Debugging**: Get clear messages about what went wrong rather than cryptic errors
3. **Enforce Safety Policies**: Ensure ethical guidelines and content policies are followed
4. **Document Expectations**: Make requirements explicit for teams and future developers

As LLMs become increasingly integrated into critical software systems, frameworks like these will be essential for ensuring they operate reliably, safely, and as intended.

## Conclusion

Design by Contract for LLMs brings time-tested software engineering principles to the frontier of AI development. By formalizing the "rules of engagement" for LLMs, we can build systems that fail less, are easier to debug when they do fail, and provide stronger guarantees about their behavior.

The papers suggest we're moving toward a future where specifying contracts for AI components will be as standard as writing unit tests for traditional software. For developers working with LLMs today, adopting these principles—even informally—can significantly improve reliability and reduce development headaches.

As AI becomes increasingly embedded in our software ecosystem, approaches like this will be crucial for bridging the gap between AI's inherent probabilistic nature and the deterministic guarantees we expect from reliable software.

## Research Collaborator | Ongoing Research | Software Engineering

<div class="text-end mb-3">
    <a href="https://github.com/thromel/llm-contracts-research" target="_blank" class="btn btn-sm btn-outline-dark">
        <i class="fab fa-github"></i> View on GitHub
    </a>
</div>
