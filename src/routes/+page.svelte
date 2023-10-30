<script lang="ts">
	import createCSSVariables from '$lib/tools/createCSSVariables/createCSSVariables';

	let input: string;
	let variablesCreated: string[] | string;

	let errorMessage: unknown;
	// $: variablesCreated = variablesCreated.split('')
	function handleCreateVariables() {
		const parsedInput = input.split(';').map((v) => v.trim());
		try {
			variablesCreated = createCSSVariables(parsedInput, {
				createShades: {
					create: true,
					number: 2
				},
				returnFormat: 'array'
			});

			errorMessage = false;
		} catch (error: unknown) {
			errorMessage = error;
		}
	}

	$: console.log(input);
</script>

<input bind:value={input} type="text" />
<button on:click={handleCreateVariables}>Create</button>

{#if errorMessage}
	<p>{errorMessage}</p>
{:else if variablesCreated?.length}
	<p>
		{#each variablesCreated as variable}
			{variable}<br />
		{/each}
	</p>
{/if}

<style>
</style>
