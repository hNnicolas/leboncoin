<script setup lang="ts">
import { useForm, useField } from "vee-validate";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { onMounted, ref } from "vue";
import { getProduct } from "@/shared/services/product.service";
import type {
  ProductFormInterface,
  ProductInterface,
} from "@/shared/interfaces/Product.interface";
import { useRoute, useRouter } from "vue-router";
import { useAdminProducts } from "../stores/adminProductStore";
import type { Category } from "@/shared/interfaces";

const firstInput = ref<HTMLInputElement | null>(null);
const product = ref<ProductInterface | null>(null);

const route = useRoute();
const router = useRouter();
const adminProductStore = useAdminProducts();
if (route.params.productId) {
  product.value = await getProduct(route.params.productId as string);
}

const initialValues = {
  title: product.value ? product.value.title : "",
  image: product.value ? product.value.image : "",
  price: product.value ? product.value.price : 0,
  description: product.value ? product.value.description : "",
  category: product.value ? product.value.category : "desktop",
};

onMounted(() => {
  firstInput.value?.focus();
});

const required = { required_error: "Veuillez renseigner ce champ" };

const validationSchema = toTypedSchema(
  z.object({
    title: z
      .string(required)
      .min(1, { message: "Le titre doit faire au moins 1 caractère" })
      .max(20, { message: "Le titre doit faire moins de 10 caractères" }),
    image: z.string(required),
    price: z
      .number(required)
      .min(0, { message: "Le prix doit être superieur à 0" })
      .max(15000, { message: "Le prix doit être inferieur à 15 000" }),
    description: z
      .string(required)
      .min(10, { message: "La description doit faire au moins 10 caractères" }),
    category: z.string(required),
  })
);

const { handleSubmit, isSubmitting } = useForm<ProductFormInterface>({
  validationSchema,
  initialValues,
});

const title = useField<string>("title");
const image = useField<string>("image");
const price = useField<number>("price");
const description = useField<string>("description");
const category = useField<Category>("category");

const trySubmit = handleSubmit(async (formValues) => {
  try {
    if (!product.value) {
      await adminProductStore.addProduct(formValues);
    } else {
      await adminProductStore.editProduct(product.value._id, formValues);
    }
    router.push("/admin/productlist");
  } catch (e) {
    console.log(e);
  }
});
</script>

<template>
  <div class="card">
    <h3 class="mb-10">
      {{ product ? "Editer un produit" : "Créer un produit" }}
    </h3>
    <form @submit="trySubmit">
      <div class="d-flex flex-column mb-20">
        <label class="mb-5">*Titre</label>
        <input ref="firstInput" v-model="title.value.value" type="text" />
        <small class="form-error" v-if="title.errorMessage.value">{{
          title.errorMessage.value
        }}</small>
      </div>
      <div class="d-flex flex-column mb-20">
        <label class="mb-5">*Image</label>
        <input v-model="image.value.value" type="text" />
        <small class="form-error" v-if="image.errorMessage.value">{{
          image.errorMessage.value
        }}</small>
      </div>
      <div class="d-flex flex-column mb-20">
        <label class="mb-5">*Prix</label>
        <input v-model="price.value.value" type="number" />
        <small class="form-error" v-if="price.errorMessage.value">{{
          price.errorMessage.value
        }}</small>
      </div>
      <div class="d-flex flex-column mb-20">
        <label class="mb-5">*Description</label>
        <textarea v-model="description.value.value"></textarea>
        <small class="form-error" v-if="description.errorMessage.value">{{
          description.errorMessage.value
        }}</small>
      </div>
      <div class="d-flex flex-column mb-20">
        <label class="mb-5">*Catégorie</label>
        <select v-model="category.value.value">
          <option value>Choisissez une catégorie</option>
          <option value="mobile">mobile</option>
          <option value="tablet">tablette</option>
          <option value="desktop">Ordinateur</option>
        </select>
        <small class="form-error" v-if="category.errorMessage.value">{{
          category.errorMessage.value
        }}</small>
      </div>
      <button class="btn btn-primary" :disabled="isSubmitting">
        Sauvegarder
      </button>
    </form>
  </div>
</template>

<style scoped lang="scss">
.card {
  width: 100%;
  max-width: 500px;
}
</style>
