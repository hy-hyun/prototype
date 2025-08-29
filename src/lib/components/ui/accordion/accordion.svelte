<script lang="ts">
	import { Accordion as AccordionPrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		value = $bindable(),
		...restProps
	} = $props<{
		ref?: HTMLElement | null;
		value?: string | string[];
		[key: string]: any;
	}>();
</script>

<AccordionPrimitive.Root
	bind:ref
	bind:value
	data-slot="accordion"
	{...restProps}
/>
