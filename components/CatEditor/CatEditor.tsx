"use client";

import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Input, Textarea } from "@heroui/input";
import { Slider } from "@heroui/slider";
import { useState } from "react";
import { ArrowLeft, DownloadCloud, Save, Trash } from "react-feather";

import CatCard from "../CatCard";
import ConfirmationButton from "../buttons/ConfirmationButton";
import PromiseButton from "../buttons/PromiseButton";
import RedirectionButton from "../buttons/RedirectionButton";

import { cloudImport, onDelete, onSave } from "./actions";

import { Cat } from "@/access/cat";

export interface EditorCat
  extends Omit<Omit<Omit<Omit<Cat, "filename">, "bytes">, "id">, "hash"> {
  filename?: string;
  bytes?: string;
  id?: string;
}

function file2Buffer(file: File) {
  return new Promise<ArrayBuffer>(function (resolve, reject) {
    const reader = new FileReader();
    const readFile = function () {
      const buffer = reader.result;

      if (!(buffer instanceof ArrayBuffer)) {
        reject("buffer was invalid");
      }

      resolve(buffer as ArrayBuffer);
    };

    reader.addEventListener("load", readFile);
    reader.addEventListener("error", reject);
    reader.readAsArrayBuffer(file);
  });
}

export default function CatEditor({
  defaultCat,
  isNew,
}: {
  defaultCat: (Omit<Omit<Cat, "bytes">, "id"> & { id?: string }) | null;
  isNew: boolean;
}) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [cat, setCat] = useState<EditorCat>(
    defaultCat !== null
      ? defaultCat
      : {
          title: "",
          description: "",
          rating: 10,
        }
  );

  return (
    <div className="flex-1 flex flex-row flex-wrap gap-4 justify-center">
      <Card className="min-w-[280px] flex-1">
        <CardHeader>
          <h1 className="text-xl">
            Katzenbild {isNew ? "hochladen" : "bearbeiten"}
          </h1>
        </CardHeader>
        <CardBody className="gap-4">
          <Input
            isRequired
            isInvalid={errors.title !== undefined}
            label="Titel"
            labelPlacement="outside"
            placeholder="Titel deines Katzenbildes"
            value={cat.title || ""}
            onChange={(e) => setCat({ ...cat, title: e.target.value })}
          />
          {errors.title && (
            <span className="text-danger text-sm italic">{errors.title}</span>
          )}
          <Textarea
            label="Beschreibung"
            labelPlacement="outside"
            placeholder="Beschreibung deines Katzenbildes"
            value={cat.description}
            onChange={(e) => setCat({ ...cat, description: e.target.value })}
          />
          <Slider
            data-testid="rating-slider"
            showSteps
            label="Bewertung"
            maxValue={10}
            minValue={1}
            value={cat.rating}
            onChange={(e) => setCat({ ...cat, rating: e as number })}
          />
          <div className="flex flex-row gap-4 items-end">
            <Input
              isRequired
              accept="image/*"
              defaultValue={cat.filename || ""}
              isInvalid={errors.picture !== undefined}
              label="Katzenbild"
              labelPlacement="outside"
              type="file"
              onChange={async (e) => {
                if (e.target.files?.length) {
                  setCat({
                    ...cat,
                    filename: e.target.files[0].name,
                    bytes: Buffer.from(
                      await file2Buffer(e.target.files[0])
                    ).toString("base64"),
                  });
                }
              }}
            />
            <PromiseButton
              isIconOnly
              onPress={async () => {
                const res = await cloudImport();

                setCat({
                  ...cat,
                  ...res,
                });
              }}
            >
              <DownloadCloud />
            </PromiseButton>
          </div>
          {errors.picture && (
            <span className="text-danger text-sm italic">{errors.picture}</span>
          )}
        </CardBody>
        <CardFooter className="gap-4 justify-end">
          <RedirectionButton isIconOnly href="/">
            <ArrowLeft />
          </RedirectionButton>
          <div className="flex-1" />
          <ConfirmationButton
            isIconOnly
            color="danger"
            description="Willst du diese niedliche Katze wirklich unwiderruflich Löschen?"
            title="Achtung"
            onConfirm={() => onDelete(defaultCat?.id!)}
          >
            <Trash />
          </ConfirmationButton>
          <PromiseButton
            isIconOnly
            color="primary"
            onPress={async () => {
              if (!cat.title) {
                setErrors({
                  ...errors,
                  title: "Bitte gib deinem Bild einen Titel",
                });

                return;
              }

              if (
                !cat.filename ||
                !cat.filename.match(/.+\.(jpg|jpeg|png)/) ||
                (!cat.bytes?.length && !cat.id)
              ) {
                setErrors({
                  ...errors,
                  picture: "Bitte lade ein Bild (jpg, jpeg, png) hoch",
                });

                return;
              }

              await onSave(defaultCat, cat, isNew);
            }}
          >
            <Save />
          </PromiseButton>
        </CardFooter>
      </Card>
      <CatCard nonInteractive cat={cat} />
    </div>
  );
}
