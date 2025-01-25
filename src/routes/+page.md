<script lang="ts">
  import github from "svelte-highlight/src/styles/github";
  import Highlight from "svelte-highlight"
  import typescript from "svelte-highlight/src/languages/typescript";
  import OutlineHelper from '$components/OutlineHelper.svelte'
</script>

<svelte:head>
  {@html github}
</svelte:head>

<OutlineHelper />

<div class="markdown-generated">

# Introduction to UCANs

User Controlled Authorization Networks (UCANs) are an extension of the popular [JSON Web Token](https://jwt.io/) format specifically designed to enable ways of authorizing offline-first apps and distributed systems.

At a high level, User Controlled Authorization Networks (UCANs) are a way of doing authorization ("what you can do") where users are fully in control. There's no all-powerful authorization server, or server of any kind required. Everything that a user is allowed to do is captured directly in a key or token, and can be sent to anyone that knows how to interpret this format.

Since all accounts are equipped with a global ID and cryptographic keys, we were able to design a system that has very few assumptions and thus works in a huge number of situations.

This setup has several advantages:

* Low effort: developers don't need to write and maintain complex access logic
* Familiar: uses very common JSON Web Tokens (JWTs)
* Invisible: users don't need to know that anything special is happening
* Flexible: access can be granted as coarse or granular as the end users wants
* Scalable: no auth server bottleneck / scales infinitely
* Secure: works with RSA, ECDSA, and EdDSA and other signature schemes
* Collaborative: users and services can delegate a subset of their access to others
* Self-contained: the token contains all the information needed to verify it

UCANs are all you need to sign into multiple machines, delegate access for service providers to do things while you are offline, securely collaborate on documents with a team, and more. You get the flexibility of fine- or coarse-grained control, all controlled by the one who cares about the data the most: the user.

We are making this available as a building block for developers to solve user authorization and delegation within their own applications.

UCANs are used by:
- [Storacha](https://storacha.network) (previously web3.storage), for delegating access to decentralized storage for thousands of developers ([blog post](https://blog.web3.storage/posts/intro-to-ucan))
- [ODD SDK](https://github.com/oddsdk/ts-odd)), for access to mutable resources
- [Awake](https://github.com/ucan-wg/awake), a mutually authenticating AKE (authenticated key exchange) for p2p applications
- Magazine publishers, to authorize discounts across business units for millions of subscribers

<h2>The UCAN data structure</h2>

Just like [JSON Web Tokens ( JWTs )](https://jwt.io/), UCANs consist of three parts separated by dots (.), which are:

* Header
* Payload
* Signature

Just like a JWT typically looks like the following.

<p>
  <span class=".eg-header"><code>Header</code></span>.<span class="eg-payload"><code>Payload</code></span>.<span class="eg-sig"><code>Signature</code></span>
</p>

Let's break down these different parts in more detail.

### Header

```
{
  "alg": "EdDSA",
  "typ": "JWT",
  "ucv": "0.8.1"
}
```

This is a standard JWT header, plus the extra `ucv` field.

* alg — the encryption algorithm used to create the UCAN
* typ — the type of token this is, this will always be 'JWT'
* ucv — "UCAN version" (so we can track the format of when it was issued)


### Payload

```
{
  "iss": "did:key:z6Mkr5aefin1DzjG7MBJ3nsFCsnvHKEvTb2C4YAJwbxt1jFS",
  "aud": "did:key:z6MkfQhLHBSFMuR7bQXTQeqe5kYUW51HpfZeaymgy1zkP2jM",
  "nbf": 1529496683,
  "exp": 9256939505,
  "att": [
    {
      "with": "wnfs://demouser.fission.name/public/photos/",
      "can": "wnfs/OVERWRITE"
    },
    {
      "with": "wnfs://demouser.fission.name/public/notes/",
      "can": "wnfs/OVERWRITE"
    }
  ],
  "prf": []
}
```
<br/>

|Field| Name | Description
|-----|---------------|------------------------------------------------------------------------------------------|
|iss  | "Issuer"      |ID of who sent it (the "from" field)
|aud  | "Audience"    |the ID of who it's intended for (the "to" field)
|nbf  | "Not before"  |Unix timestamp of when it becomes valid (typically when it was created, but not always)
|exp  | "Expiration"      |Unix timestamp of when it stops being valid
|att  | "Attenuation"       |capabilities delegated to the audience by the issuer
|prf  | "Proof of Delegation"       |an array of nested token with equal or greater privileges
<br/>

### Signature

These are then all signed with the user's private key. This key must match the public key in the iss field (user IDs are public keys), directly authenticating the token. As the token is a complete description of access, this token is self-validating with no need to look at other data or services.

## Delegation

What if you want to grant another user or service the ability to perform some action on your behalf? As long as they have a valid UCAN, they can wrap it in another with equal or lesser rights and include the original in the prf field.

Since every UCAN layer is self-signed, we can trace back to the root (empty prf field), and know who the delegate is acting as. This chain of tokens is itself is the proof that you can perform some action. The nested proof is encoded as a bearer token. This is because it needs to include its signature to prove that it's valid, and a JWT signature is on the content encoded this way.

This token is thus valid as long as:

 * All token signatures are correct
 * The time range falls within the time bounds of the prf tokens
 * The attenuation is less-or-equal than the capabilities granted by the prf tokens
 * The outer token's iss field matches the aud field of each prf token (chain "to" and "from" correctly)
 * The timestamps are valid at the present time

## Hashing

These chains can get large, so you can optionally hash the outermost one before sending it to a server. This acts as a "content address", meaning that if the service hasn't seen it before, it can separately request that token, but if it already has it in cache and doesn't need to get it over the network. Since hashes are much smaller than their content, this can save a lot of bandwidth on repeated requests.

</div>

<style>
:global(.\.eg-header) {
  color: red;
}

:global(.eg-payload) {
  color: green;
}

:global(.eg-sig) {
  color: blue;
}
</style>
