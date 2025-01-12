<template>
  <div class="item">
    <div class="details">
      <h1>
        <slot name="heading"></slot>
      </h1>
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.item {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 4.5rem;
  margin-bottom: 2rem;
  color: var(--color-heading);
  font-weight: 500;
  letter-spacing: 0.07em;
}
</style>
