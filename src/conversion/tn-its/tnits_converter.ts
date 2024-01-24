import { XMLBuilder as Builder } from "fast-xml-parser";
import { AssetTypeChanges } from "./helper/interfaces";
import { RoadFeatureDataset } from "./helper/road_feature";

export class TnItsConverter {
    dataset: { RoadFeatureDataset: RoadFeatureDataset};

    constructor(data: AssetTypeChanges[], dataSetId: string, endTime: string) {
        this.dataset =  {RoadFeatureDataset: new RoadFeatureDataset(dataSetId, endTime, "Update")};
        for (const changes of data) {
            const assetType = changes.assetType;
            const roadFeatures = assetType.service.splitRoadFeatures(changes.features, assetType, endTime);
            for (const roadFeature of roadFeatures) {
                this.dataset.RoadFeatureDataset.addRoadFeature(roadFeature);
            }
        }

        // If there are no road features in the dataset, add null value to array
        // This will generate empty tag <roadFeatures/> in xml which is needed for xml to pass validation
        if (this.dataset.RoadFeatureDataset.roadFeatures.length < 1) {
            this.dataset.RoadFeatureDataset.addRoadFeature(null);
        }
    }

    datasetAsXML() {
        const options = {
            attrNodeName: "$",
            textNodeName: "_text",
            suppressEmptyNode: true
        };
        const parser = new Builder(options);
        return parser.build(this.dataset);
    }
}

