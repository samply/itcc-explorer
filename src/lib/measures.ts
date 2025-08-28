import type { FhirMeasureItem } from "@samply/lens";

const itccPatientsMeasure: FhirMeasureItem = {
    key: "patients",
    measure: {
        code: {
            text: "patients",
        },
    population: [
        {
          code: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/measure-population",
                code: "initial-population"
              }
            ]
          },
          criteria: {
            language: "text/cql-identifier",
            expression: "InInitialPopulation"
          }
        }
      ],
      stratifier: [
        {
          code: {
            text: "Gender"
          },
          criteria: {
            language: "text/cql",
            expression: "Gender"
          }
        }
      ]
    },
  cql:
    `DKTK_STRAT_GENDER_STRATIFIER`
}

const itccDiagnosisMeasure:FhirMeasureItem = {
  key: "diagnosis",
  measure: {
    code: {
      text: "diagnosis"
    },
    extension: [
      {
        url: "http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/cqfm-populationBasis",
        valueCode: "Condition"
      }
    ],
    population: [
      {
        code: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/measure-population",
              code: "initial-population"
            }
          ]
        },
        criteria: {
          language: "text/cql-identifier",
          expression: "Diagnosis"
        }
      }
    ],
    stratifier: [
      {
        code: {
          text: "diagnosis"
        },
        criteria: {
          language: "text/cql-identifier",
          expression: "DiagnosisCode"
        }
      },
      {
        code: {
          text: "diagnosisAge"
        },
        criteria: {
          language: "text/cql-identifier",
          expression: "DiagnosisAge"
        }
      }
    ]
  },
  cql:`
  ITCC_STRAT_DIAGNOSIS_STRATIFIER
  ITCC_STRAT_AGE_CLASS_STRATIFIER
  `
}

const itccObservationMeasure:FhirMeasureItem = {
  key: "MolecularMarker",
  measure: {
    code: {
      text: "MolecularMarker"
    },
    extension: [
      {
        url: "http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/cqfm-populationBasis",
        valueCode: "Observation"
      }
    ],
    population: [
      {
        code: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/measure-population",
              code: "initial-population"
            }
          ]
        },
        criteria: {
          language: "text/cql-identifier",
          expression: "GeneticVariantCount"
        }
      }
    ],
    stratifier: [
      {
        code: {
          text: "MolecularMarkers"
        },
        criteria: {
          language: "text/cql-identifier",
          expression: "GeneticVariantCode"
        }
      }
    ]
  },
  cql:`
  DKTK_STRAT_GENETIC_VARIANT
  `
}

export const measures: FhirMeasureItem[] = [
    itccPatientsMeasure,
    itccDiagnosisMeasure,
    itccObservationMeasure,
]