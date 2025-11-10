"""
eda_template.py
---------------------------------
Performs exploratory data analysis (EDA) on Hack the Track datasets.

Run directly via command line:
    python eda_template.py --track COTA --race 1 --summary
"""

import argparse
from dataset_manager import DatasetManager
import matplotlib.pyplot as plt


def summarize(df, title):
    """Print summary statistics for a dataframe."""
    print(f"\n=== {title} ===")
    print(df.describe(include='all'))
    print(f"Rows: {len(df)}, Columns: {len(df.columns)}")


def main():
    parser = argparse.ArgumentParser(description="Hack the Track EDA Template")
    parser.add_argument("--track", required=True, help="Track name (e.g., COTA, Barber)")
    parser.add_argument("--race", required=True, type=int, help="Race number")
    parser.add_argument("--summary", action="store_true", help="Print summary statistics")
    parser.add_argument("--plot", action="store_true", help="Plot lap time vs lap number")
    args = parser.parse_args()

    dm = DatasetManager()
    lap_data = dm.get_lap_times(args.track, args.race)

    if args.summary and lap_data is not None:
        summarize(lap_data, f"{args.track} Race {args.race} Lap Data")

    if args.plot and lap_data is not None and "LAP_TIME" in lap_data.columns:
        plt.figure()
        plt.plot(lap_data["LAP_TIME"])
        plt.title(f"{args.track} Race {args.race} - Lap Time Trend")
        plt.xlabel("Lap")
        plt.ylabel("Lap Time (s)")
        plt.show()


if __name__ == "__main__":
    main()
