import { Routes } from "@angular/router";
import { ImageMappingComponent } from "./image-mapping.component";
import { ImageMappingCrudComponent } from "./image-mapping-crud/image-mapping-crud.component";

export const IMAGE_MAPPINNG_ROUTES: Routes = [
  {
    path: 'image-mapping',
    component: ImageMappingComponent,
    data: {
      breadcrumb: {
        title: 'Image Mapping',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'image-mapping/create',
    component: ImageMappingCrudComponent,
    data: {
      breadcrumb: {
        title: 'Image Mapping',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'image-mapping/:imageMapId/edit',
    component: ImageMappingCrudComponent,
    data: {
      breadcrumb: {
        title: 'Image Mapping',
        stepbackCount: 0
      }
    }
  }
]